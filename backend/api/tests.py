from django.test import TestCase, Client
from .schemas import TestReq, TestResp
from api.api import test_endpoint

# Create your tests here.

class TestEndpointTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_valid_name(self):
        data = TestReq(name="Test Name")
        status_code, response = test_endpoint(None, data)
        self.assertEqual(status_code, 200)
        self.assertIsInstance(response, TestResp)
        self.assertEqual(response.name, "Test Name")

    def test_empty_name(self):
        data = TestReq(name="")
        status_code, response = test_endpoint(None, data)
        self.assertEqual(status_code, 404)
        self.assertEqual(response, {"error": "Name is required"})
