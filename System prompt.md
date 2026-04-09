\# 🚀 A/B Testing Dashboard System (NAD+ Funnel)



\## 📌 Overview



This project is a custom-built A/B testing system designed to track, analyze, and optimize funnel performance for the product:



\*\*NAD+ Supplement for Men\*\*



The system enables dynamic headline testing, tracks user behavior (page views, clicks, conversions), and provides a dashboard to identify the best-performing variant.



---



\## 🧠 Core Objective



\- Dynamically test headlines (A/B/C)

\- Track user interactions per variant

\- Store structured analytics data

\- Display performance in a dashboard

\- Identify the best-performing variant (leader)



---



\## 🏗️ System Architecture



```text

GHL Funnel (Frontend)

→ Custom JavaScript (Variant + Tracking)

→ Next.js API (/api/ab-track)

→ Supabase Database

→ Dashboard (Next.js + Tailwind)

⚙️ Tech Stack

Frontend (Funnel)

GoHighLevel (GHL)

Custom HTML/CSS/JavaScript

localStorage (variant persistence)

Backend

Next.js (App Router)

API Route: /api/ab-track

Database

Supabase (PostgreSQL)

Dashboard

Next.js

Tailwind CSS

🧪 A/B Testing Logic

Variant Assignment

Random assignment (A / B / C)

Stored in localStorage

Ensures consistent experience per user

Example Variants

A: Original headline

B: Alternative headline

C: Alternative headline

📊 Event Tracking

Events (MVP)

page\_view

cta\_click

Future Events

conversion

purchase

revenue

📡 API Layer

Endpoint

POST /api/ab-track

Purpose

Receive tracking events from funnel

Validate payload

Process data

Store in Supabase

Example Payload

{

&nbsp; "event": "page\_view",

&nbsp; "test\_key": "nad\_headline\_test\_v1",

&nbsp; "variant": "B",

&nbsp; "page\_url": "https://example.com",

&nbsp; "page\_path": "/funnel",

&nbsp; "timestamp": "2026-04-07T10:00:00.000Z",

&nbsp; "user\_agent": "Mozilla/5.0"

}

Supported Events

page\_view

cta\_click

conversion (future)

🗄️ Database Structure (Supabase)

1\. ab\_tests



Stores test definitions



Field	Type

id	UUID

name	text

test\_key	text

status	text

created\_at	timestamp

2\. ab\_variants



Stores variants



Field	Type

id	UUID

test\_id	UUID

variant\_key	text

headline	text

is\_control	boolean

3\. ab\_events



Stores tracking events



Field	Type

id	UUID

test\_id	UUID

variant\_id	UUID

event\_type	text

page\_url	text

page\_path	text

user\_agent	text

revenue\_value	numeric

metadata	JSONB

created\_at	timestamp

4\. ab\_sessions (Phase 2)



Optional session tracking



🔁 Data Flow

Page View

User visits funnel

→ Variant assigned (A/B/C)

→ JS sends page\_view

→ API validates

→ Supabase stores event

CTA Click

User clicks CTA

→ JS sends cta\_click

→ API receives event

→ Stored in database

📊 Dashboard (MVP)

Core Features

KPI Cards

Visitors

Clicks

Conversion Rate

Leader Variant

Variant Table

Variant (A/B/C)

Headline

Visitors

Clicks

CTR

Conversion Rate

Leader Badge

Charts

Visitors per variant

Conversion comparison

🧠 Metrics

Visitors per variant

Click-through rate (CTR)

Conversion rate

Revenue per variant (future)

Leader detection

🧩 Development Phases

Phase 1 – MVP

A/B testing (headline)

Tracking (page\_view, cta\_click)

API endpoint

Supabase setup

Basic dashboard

Phase 2 – Sessions

Add session tracking

Improve user consistency

Phase 3 – Conversion Tracking

Track conversions

Add revenue data

Phase 4 – Dashboard Expansion

Filters (date/test)

Leader indicators

Test history

🔐 Security

Frontend (GHL) never connects directly to Supabase

All data goes through Next.js API

Supabase keys stay server-side

🎯 MVP Success Criteria

Variant assignment works

Tracking events sent successfully

API receives and validates data

Events stored in Supabase

Dashboard displays correct metrics

💡 Future Enhancements

Subheadline testing

Pricing tests

Image testing

Funnel optimization experiments

Multi-test support

Automated winner detection

🧠 Summary



This system enables full control over A/B testing without relying on third-party tools. It provides a scalable, flexible, and cost-effective solution for testing funnel performance and optimizing conversions.

