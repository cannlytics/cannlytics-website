"""
URLs | Cannlytics Website
Created: 12/29/2020
Resources: https://docs.djangoproject.com/en/3.1/topics/http/urls/
"""
from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from django_robohash.views import robohash
from . import api, views


# Main URLs
urlpatterns = [
    path("", views.GeneralView.as_view(), name="index"),
    path("admin/", admin.site.urls, name="admin"),
    path("contact/", views.ContactView.as_view(), name="contact"),
    path("community/", views.CommunityView.as_view(), name="community"),
]

# Apps
urlpatterns += [
    path("api/", include("cannlytics_api.urls"), name="api"),
    path("docs/", include("cannlytics_docs.urls"), name="docs"),
]

# Labs (Turn into standalone app?)
urlpatterns += [
    path("labs/", views.CommunityView.as_view(), name="labs"), # Redundant
    # path("labs\.json", views.CommunityView.as_view()),
    path('labs/new/', views.NewLabView.as_view()),
    path('labs/<slug:lab>/', views.LabView.as_view()),
    # path('labs/<slug:lab>/.json', views.LabView.as_view())
]

# Functionality
urlpatterns += [
    path("download-lab-data/", api.download_lab_data),
    path('robohash/<string>/', robohash, name='robohash'),
    path("subscribe/", api.subscribe, name="subscribe"),
    path("promotions/", api.promotions, name="promotions"),
]

# General pages
urlpatterns += [
    path("<slug:page>/", views.GeneralView.as_view(), name="page"),
    path("<slug:page>/<slug:section>/", views.GeneralView.as_view(), name="section"),
]

# Serve static assets in development and production.
if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(
        settings.STATIC_URL,
        document_root=settings.STATIC_ROOT
    )

