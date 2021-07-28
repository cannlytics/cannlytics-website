"""
URLs | Cannlytics Website
Created: 12/29/2020
Updated: 7/27/2021
Resources: https://docs.djangoproject.com/en/3.1/topics/http/urls/
"""
# External imports
from django.conf import settings
from django.conf.urls import handler404, handler500
from django.contrib import admin
from django.urls import include, path
from django_robohash.views import robohash

# Internal imports
from website.views import data, views


# Main URLs
urlpatterns = [
    path('', views.GeneralView.as_view(), name='index'),
    path('admin/', admin.site.urls, name='admin'),
    path('contact/', views.ContactView.as_view(), name='contact'),
    path('community/', views.CommunityView.as_view(), name='community'),
    # path('api/', include('cannlytics_api.urls'), name='api'),
    # path('docs/', include('cannlytics_docs.urls'), name='docs'),
    path('labs/', views.CommunityView.as_view(), name='labs'),  # Redundant
    path('labs/new/', views.NewLabView.as_view()),
    path('labs/<lab>/', views.LabView.as_view()),
    path('download-lab-data/', data.download_lab_data),
    path('robohash/<string>/', robohash, name='robohash'),
    path('subscribe/', data.subscribe, name='subscribe'),
    path('promotions/', data.promotions, name='promotions'),
    path('videos/', data.promotions, name='videos'),
    path('videos/<section>/', data.promotions, name='video'),
    path('<page>/', views.GeneralView.as_view(), name='page'),
    path('<page>/<section>/', views.GeneralView.as_view(), name='section'),
]

# Serve static assets in development and production.
if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


# TODO: Error pages.
# handler404 = 'console.views.main.handler404'
# handler500 = 'console.views.main.handler500'
