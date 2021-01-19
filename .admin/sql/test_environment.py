from django.test.utils import setup_test_environment
from django.test import Client
from django.urls import reverse


setup_test_environment()
client = Client()

response = client.get(reverse("polls:index"))
response.status_code
response.content
response.context["latest_question_list"]
