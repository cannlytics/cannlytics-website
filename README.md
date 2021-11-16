# <img height="32" alt="" src="https://cannlytics.com/static/cannlytics_website/images/logos/cannlytics_calyx_detailed.svg"> Cannlytics Website

[![License: MIT](https://img.shields.io/badge/License-MIT-darkgreen.svg)](https://opensource.org/licenses/MIT)

Cannlytics provides a user-friendly interface to quickly receive samples, perform analyses, collect and review results, and publish certificates of analysis (CoAs). There are also built in logistics, CRM (client relationship management), inventory management, and invoicing tools. The Cannlytics engine comes with **batteries included**, but you are always welcome to supercharge your setup with modifications and custom components. This documentation explains Cannlytics' website architecture and how to build, develop, and publish the website. The website is live at <https://cannlytics.com>.

- [🐱‍👓 Introduction](#introduction)
- [🌱 Installation](#installation)
- [🏗️ Architecture](#architecture)
- [🔨 Development](#development)
- [🚀 Publishing](#publishing)
- [❤️ Support](#support)
- [🏛️ License](#license)

## 🐱‍👓 Introduction <a name="introduction"></a>

Cannlytics is a healthy mix of user friendly interfaces and software that you can use in your cannabis-testing lab. Users do not have to have any advanced knowledge and can jump in at any point. There are many advanced features that people with background in the web stack, Python, or your favorite programming language can jump right into. The Cannlytics Website provides people with information about Cannlytics. The Cannlytics Engine is a mobile, desktop, and web app that provides administrators, laboratory staff, laboratory clients, and client integrators to interact with laboratory information. You can find all Cannlytics products below.

- [Cannlytics AI](https://github.com/cannlytics/cannlytics-ai)
- [Cannlytics API](https://github.com/cannlytics/cannlytics-api)
- [Cannlytics App](https://cannlytics.com/cannlytics-app)
- [Cannlytics Console](https://github.com/cannlytics/cannlytics)
- [Cannlytics Documentation](https://github.com/cannlytics/cannlytics-docs)
- [Cannlytics Python SDK](https://github.com/cannlytics/cannlytics-engine)
- [Cannlytics Website](https://github.com/cannlytics/cannlytics-website)

<!-- Planned: -->
<!-- - [Cannlytics Assistant](https://cannlytics.com/assistant) -->
<!-- - [Cannlytics Beanstalk](https://cannlytics.com/beanstalk) -->
<!-- - [Cannlytics OakHeart Authentication](https://cannlytics.com/authentication) -->
<!-- - [Cannlypedia](https://cannlytics.com/cannlypedia) -->

## 🌱 Installation <a name="installation"></a>

First things first, you can clone the repository.

```shell
git clone https://github.com/cannlytics/cannlytics-website.git
```

Development requires that you install the following tools:

- [Python](https://www.python.org/psf/)
- [Django](https://docs.djangoproject.com/en/3.1/intro/tutorial01)
- [Docker](https://docs.docker.com/get-docker/)
- [Firebase Tools](https://firebase.google.com/docs/cli)
- [Google Cloud SDK](https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe)
- [Node.js](https://nodejs.org/en/download/)
- *Optional* [Gimp](https://www.gimp.org/about/)
- *Optional* [Inkscape](https://inkscape.org/about/)

You will also need an account and a project on the following platforms:

- [Google Cloud Platform](https://cloud.google.com/gcp)
- [Firebase](https://firebase.google.com/)

## 🏗️ Architecture <a name="architecture"></a>

Cannlytics is an open, transparent box and you do not have to guess about the software used and how it is implemented. The Cannlytics Website is built with [Python](https://www.python.org/) using the [Django](https://www.djangoproject.com/) framework. The Cannlytics Website runs on [Cloud Run](https://firebase.google.com/docs/hosting/cloud-run) and is hosted with [Firebase Hosting](https://firebase.google.com/docs/hosting). The Cannlytics Website utilizes [Firebase Authentication](https://firebase.google.com/docs/auth), an optional SQL database, a [Firestore](https://firebase.google.com/docs/firestore) NoSQL database for real-time data management, and [Firebase Storage](https://firebase.google.com/docs/storage) for file storage. For publishing, the Cannlytics Website utilizes several Google Cloud services, including:

- [Cloud Build](https://cloud.google.com/build/docs) is used for containerizing the app;
- [Cloud Registry](https://cloud.google.com/container-registry) is used for uploading the app;
- [Cloud Run](https://firebase.google.com/docs/hosting/cloud-run) is used to run the stateless container.
- *Optional* [Cloud SQL](https://cloud.google.com/sql) can be utilized if desired.
- [Cloud Storage](https://cloud.google.com/storage) is used for file storage.
- [Cloud Secret Manager](https://cloud.google.com/secret-manager/) is used for storing configurations and keeping secrets secret.

> See [Django on Cloud Run](https://codelabs.developers.google.com/codelabs/cloud-run-django) for a good tutorial on how to run Django projects on Cloud Run.

## 🔨 Development <a name="development"></a>

Development can happen in many avenues. Principally, clone the repository, begin working on an area, referring to documentation as needed, and commit your changes. You can run the website locally for development with:

```shell
npm run start
```

## 🚀 Publishing <a name="publishing"></a>

See [the publishing guide](https://cannlytics.com/docs/website/publishing) for complete instructions on how to set your app up for publishing to Cloud Run. Once set up, publishing is done with one command:

```shell
npm run publish
```

The build process contains three steps:

### 1. Containerize your app and upload it to Container Registry.

Build your container image using Cloud Build by running the following command from the directory containing the Dockerfile:

`gcloud builds submit --tag gcr.io/cannlytics/cannlytics-website`

### 2. Deploy your container image to Cloud Run.

`gcloud beta run deploy cannlytics-website --image gcr.io/cannlytics/cannlytics-website --region us-central1 --allow-unauthenticated --service-account=${GCS_SA}`

### 3. Direct hosting requests to your containerized app.

This step provides access to this containerized app from a [Firebase Hosting](https://firebase.google.com/docs/hosting) URL, so the app can generate dynamic content for the Firebase-hosted site.

`firebase deploy --only hosting:production`

## ❤️ Support <a name="support"></a>

Made with ❤️ and <a href="https://opencollective.com/cannlytics-company">your good will</a>.

## 🏛️ License <a name="license"></a>

```
Copyright (c) 2021 Cannlytics and Cannlytics Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
