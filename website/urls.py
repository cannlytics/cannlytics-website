"""
URLs | Cannlytics Website
Copyright (c) 2021 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 12/29/2020
Updated: 12/30/2021
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
    path('api/', include('api.urls'), name='api'),
    path('src/', include([
        path('auth/login', auth.login),
        path('auth/logout', auth.logout),
        path('email/send-message', email.send_message),
        path('market/buy', market.buy_data),
        path('market/download-lab-data', market.download_lab_data),
        path('market/promotions', market.promotions, name='promotions'),
        path('market/publish', market.publish_data),
        path('market/sell', market.sell_data),
        path('payments/subscribe', subscriptions.subscribe, name='subscribe'),
        path('payments/subscriptions', subscriptions.get_user_subscriptions, name='subscriptions'),
    ])),
    path('testing', include([
        path('', testing.TestingView.as_view(), name='testing'),
        path('/analyses', testing.TestingView.as_view(), name='analyses'),
        path('/labs', testing.TestingView.as_view(), name='labs'),  # Redundant?
        path('/labs/new', testing.NewLabView.as_view(), name='new-lab'),
        path('/labs/<lab>', testing.LabView.as_view(), name='lab'),
        path('/regulations', testing.TestingView.as_view(), name='regulations'),
    ])),
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
