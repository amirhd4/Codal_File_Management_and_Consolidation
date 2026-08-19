import os
import io
import pytest
from fastapi.testclient import TestClient
import openpyxl
import pandas as pd

from app.main import app
from app.core.config import settings

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_fund_crud_and_excel():
    # 1. Create fund
    fund_data = {"name": "صندوق تست یک", "codal_url": "https://codal.ir/test1"}
    response = client.post("/api/v1/funds/", json=fund_data)
    assert response.status_code == 200
    created = response.json()
    assert created["name"] == fund_data["name"]
    fund_id = created["id"]

    # 2. Get funds
    response = client.get("/api/v1/funds/")
    assert response.status_code == 200
    funds = response.json()
    assert len(funds) >= 1

    # 3. Update fund
    update_data = {"name": "صندوق تست ویرایش شده", "codal_url": "https://codal.ir/test1_updated"}
    response = client.put(f"/api/v1/funds/{fund_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["name"] == update_data["name"]

    # 4. Export excel
    response = client.get("/api/v1/funds/export/excel")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    # 5. Import excel
    # Create an excel file in memory
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["نام صندوق", "لینک کدال"])
    ws.append(["صندوق جدید ایمپورت", "https://codal.ir/imported"])
    excel_io = io.BytesIO()
    wb.save(excel_io)
    excel_io.seek(0)

    files = {"file": ("test_import.xlsx", excel_io, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    response = client.post("/api/v1/funds/import/excel?replace_existing=false", files=files)
    assert response.status_code == 200
    imported = response.json()
    assert any(f["name"] == "صندوق جدید ایمپورت" for f in imported)

    # 6. Delete fund
    response = client.delete(f"/api/v1/funds/{fund_id}")
    assert response.status_code == 200

def test_workflow_pipeline():
    # Step 1: Download
    response = client.post("/api/v1/workflow/step1/download")
    assert response.status_code == 200
    res1 = response.json()
    assert res1["step"] == 1
    assert "results" in res1

    # Step 2: Unprotect
    response = client.post("/api/v1/workflow/step2/unprotect")
    assert response.status_code == 200
    res2 = response.json()
    assert res2["step"] == 2

    # Step 3: Inspect
    response = client.get("/api/v1/workflow/step3/inspect")
    assert response.status_code == 200
    res3 = response.json()
    assert res3["step"] == 3
    assert "available_sheets" in res3["results"]

    # Step 3-4: Consolidate
    response = client.post("/api/v1/workflow/step3-4/consolidate", json={"selected_sheets": ["سهام"]})
    assert response.status_code == 200
    res4 = response.json()
    assert res4["step"] == 4
    assert res4["results"]["status"] == "success"

    # Download result
    response = client.get("/api/v1/workflow/download-result")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
