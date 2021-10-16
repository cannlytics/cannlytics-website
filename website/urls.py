"""
URLs | Cannlytics Website
Created: 12/29/2020
Updated: 10/15/2021
Resources: https://docs.djangoproject.com/en/3.1/topics/http/urls/
"""
# External imports
from django.conf import settings
from django.conf.urls import handler404, handler500
from django.contrib import admin
from django.urls import include, path
from django_robohash.views import robohash

# Internal imports
from website.views import api, data, views, email

# FIXME: Fix missing pages and 500 errors. 

# 404:

    # /robots.txt/
    # /ads.txt/

# 500 errors:

    # /subscribe/

# Broken API endpoints:

    # /api/v1/labs/

# Main URLs
urlpatterns = [
    path('', views.GeneralView.as_view(), name='index'),
    path('admin/', admin.site.urls, name='admin'),
    path('api/', include([
        path('labs/', api.labs),
        path('labs/<uuid:org_id>/', api.labs),
        path('labs/<uuid:org_id>/analyses/', api.lab_analyses),
        path('labs/<uuid:org_id>/logs/', api.lab_logs),
        path('labs/download/', data.download_lab_data),
        path('promotions/', data.promotions, name='promotions'),
        path('subscribe/', data.subscribe, name='subscribe'),
        path('send-message/', email.send_message),
        path('v1/data/buy/', data.buy_data),
        path('v1/data/publish/', data.publish_data),
        path('v1/data/sell/', data.sell_data),
    ])),
    path('community/', views.CommunityView.as_view(), name='community'),
    path('labs/', views.CommunityView.as_view(), name='labs'),  # Redundant
    path('labs/new/', views.NewLabView.as_view()),
    path('labs/<lab>/', views.LabView.as_view()),
    path('robohash/<string>/', robohash, name='robohash'),
    path('videos/', views.VideosView.as_view(), name='videos'),
    path('videos/<video_id>/', views.VideosView.as_view(), name='video'),
    path('<page>/', views.GeneralView.as_view(), name='page'),
    path('<page>/<section>/', views.GeneralView.as_view(), name='section'),
    path('<page>/<section>/<str:unit>', views.GeneralView.as_view()),
]

# FIXME: Broken documentation links.
# /docs/website/publishing/
# /docs/
# docs/app/get-started/
# /docs/website/installation/contributing/
# /docs/website/publishing/
# /docs/website/architecture
# /docs/api/regulations/
# /docs/api/instruments/
# /docs/api/authentication/
# /docs/lims/get-started/
# /docs/api/labs/
# /docs/console/installation/
# /docs/api/limits/
# /docs/about/faq/
# /docs/api/lab_results/

# Redirects from old pages.
# https://stackoverflow.com/questions/35903832/how-to-redirect-to-external-url-in-django
# urlpatterns += [
#     path('docs/', include([
#         path('', api.labs),
#         path('labs/', api.labs),
#     ])),
# ]

# Serve static assets in development and production.
if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


# TODO: Error pages.
# handler404 = 'console.views.main.handler404'
# handler500 = 'console.views.main.handler500'
