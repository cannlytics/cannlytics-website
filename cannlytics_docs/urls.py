from django.urls import path
from django.views.generic import RedirectView

from . import views

app_name = "cannlytics_docs"
urlpatterns = [
    path("", views.CannlyticsDocsView.as_view(), name="index"),
    path('<slug:product>/', views.CannlyticsDocsView.as_view(), name="doc"),
    path('<slug:product>/<slug:section>/', views.CannlyticsDocsView.as_view(), name="doc-section"),
]
