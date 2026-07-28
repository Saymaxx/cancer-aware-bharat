class TestRateLimiting:
    def test_volunteer_register_limited_to_5_per_minute(self, client):
        for i in range(5):
            client.post("/auth/volunteer/register", json={
                "name": f"Rate Test {i}",
                "email": f"ratetest{i}@example.com",
                "phone": "+91 90000 19191",
                "password": "SuperSecret123",
            })
        sixth = client.post("/auth/volunteer/register", json={
            "name": "Rate Test 6",
            "email": "ratetest6@example.com",
            "phone": "+91 90000 19191",
            "password": "SuperSecret123",
        })
        assert sixth.status_code == 429

    def test_partner_request_limited_to_5_per_minute(self, client):
        for i in range(5):
            client.post("/hospitals/partner-requests", json={
                "hospitalName": f"Rate Test Hospital {i}",
                "contactName": "Dr. Rate Test",
                "email": f"rate{i}@example.com",
                "phone": "+91 90000 20202",
                "city": "Kolkata",
            })
        sixth = client.post("/hospitals/partner-requests", json={
            "hospitalName": "Rate Test Hospital 6",
            "contactName": "Dr. Rate Test",
            "email": "rate6@example.com",
            "phone": "+91 90000 20202",
            "city": "Kolkata",
        })
        assert sixth.status_code == 429

    def test_enquiry_submission_limited_to_10_per_minute(self, client):
        for i in range(10):
            client.post("/enquiries", json={
                "patientName": f"Rate Test Patient {i}", "age": 40, "gender": "Female",
                "phone": "+91 90000 21212", "city": "Pune", "reason": "Free Cancer Screening",
            })
        eleventh = client.post("/enquiries", json={
            "patientName": "Rate Test Patient 11", "age": 40, "gender": "Female",
            "phone": "+91 90000 21212", "city": "Pune", "reason": "Free Cancer Screening",
        })
        assert eleventh.status_code == 429
