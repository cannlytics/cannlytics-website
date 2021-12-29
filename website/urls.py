"""
URLs | Cannlytics Website
Copyright (c) 2021 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 12/29/2020
Updated: 12/27/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# External imports.
from django.conf import settings
from django.conf.urls import handler404, handler500 #pylint: disable=unused-import
from django.contrib import admin
from django.urls import include, path
from django_robohash.views import robohash

# Internal imports.
from website.views import (
    auth,
    email,
    main,
    market,
    subscriptions,
    testing,
    videos,
)

# Main URLs.
urlpatterns = [
    path('', main.GeneralView.as_view(), name='index'),
    # Optional: Remove /admin if it is not needed. Less code, more secure.
    # path('admin', admin.site.urls, name='admin'),
    path('api/', include('api.urls'), name='api'),
    path('src/', include([
        path('login', auth.login),
        path('logout', auth.logout),
        path('promotions', market.promotions, name='promotions'),
        path('send-message', email.send_message),
        path('subscribe', subscriptions.subscribe, name='subscribe'),
        path('subscriptions', subscriptions.get_user_subscriptions, name='subscriptions'),
        # TODO: Add back method for downloading lab data?
        # path('labs/download', data.download_lab_data),
    ])),
    path('testing', testing.CommunityView.as_view(), name='testing'),
    path('testing/labs', testing.CommunityView.as_view(), name='labs'),  # Redundant?
    path('testing/labs/new', testing.NewLabView.as_view()),
    path('testing/labs/<lab>', testing.LabView.as_view()),
    path('testing/analyses', testing.LabView.as_view()),
    path('testing/regulations', testing.LabView.as_view()),
    path('robohash/<string>', robohash, name='robohash'),
    path('videos', videos.VideosView.as_view(), name='videos'),
    path('videos/<video_id>', videos.VideosView.as_view(), name='video'),
    path('<page>', main.GeneralView.as_view(), name='page'),
    path('<page>/<section>', main.GeneralView.as_view(), name='section'),
    path('<page>/<section>/<str:unit>', main.GeneralView.as_view(), name='unit'),
]

# Serve static assets in development and production.
if settings.DEBUG:
    from django.conf.urls.static import static #pylint: disable=ungrouped-imports
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Error pages.
handler404 = 'website.views.main.handler404' #pylint: disable=invalid-name
handler500 = 'website.views.main.handler500' #pylint: disable=invalid-name
