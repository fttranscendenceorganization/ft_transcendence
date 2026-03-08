*This project has been created as part of the 42 curriculum by houdaifa-drahm, youssef-akhadad, ahmed-ahlaqqach, mohamed-mazouz.*

# NetPong — ft_transcendence

> A full-stack real-time air-hockey platform with themed game modes, live multiplayer, AI opponent, chat, leaderboards, and OAuth-secured accounts.

---

## Table of Contents

- [Description](#description)
- [Team Information](#team-information)
- [Project Management](#project-management)
- [Technical Stack](#technical-stack)
- [Database Schema](#database-schema)
- [Features List](#features-list)
- [Modules](#modules)
- [Individual Contributions](#individual-contributions)
- [Instructions](#instructions)
- [Security & Compliance](#security--compliance)
- [Resources](#resources)

---

## Description

**NetPong** is a real-time multiplayer web application built as the final project of the 42 Common Core curriculum. It is a full-stack air-hockey game platform featuring four unique themed game modes (Joker, Kitty Cat, Soul Society, Zombie Land), live remote multiplayer, an AI opponent, a complete social system (friends, chat, DMs), XP-based gamification, user profiles with avatars, and a full observability stack (ELK + Prometheus/Grafana).

**Key Features:**
- Real-time multiplayer game with four themed modes rendered on HTML5 canvas
- AI opponent with easy/hard difficulty levels
- Live matchmaking queue with ready-check system
- Full chat system: global room, direct messages, reactions, presence indicators
- Social layer: friends, blocking, online status
- OAuth2 login via Google, GitHub, and 42 Intra
- XP/level/points system with leaderboard and match history
- Full DevOps stack: Docker Compose, Nginx, Prometheus, Grafana, ELK

---

## Team Information

| Name | Role | Responsibilities |
|------|------|-----------------|
| **Houdaifa Drahm** | Tech Lead | Designed and built the entire NestJS backend architecture: authentication system (JWT, refresh cookies, guards, strategies), TypeORM database entities and relations, all REST API controllers and services, WebSocket gateways, input validation pipeline, and CORS/security configuration. Owned the backend structure from day one. |
| **Ahmed Ahlaqqach** | Product Owner (PO) | Built all frontend pages and components using React 18 + Vite: themed game canvas renderers, chat UI, auth flows (login/signup/OAuth callbacks), profile screens, leaderboard, match history, password reset flows, and 404 page. Defined the user experience and validated all frontend-facing features. |
| **Mohamed Mazouz** | DevOps Engineer + Project Manager (PM) | Owned the entire infrastructure: Docker and docker-compose files (dev/prod/monitoring), Nginx reverse proxy with TLS termination, Prometheus metrics scraping, Grafana dashboards and alerting, ELK stack (Elasticsearch, Logstash, Kibana) setup, automated backups, and all environment configuration. Also coordinated team tasks, tracked progress, and organized weekly syncs. |
| **Youssef Akhadad** | Developer | Implemented the AI opponent logic in game.service.ts (physics-based paddle AI with easy/hard modes), the user profile edit feature (username, first name, last name, avatar upload) on both frontend and backend, and the contact page on both frontend and backend. |

---

## Project Management

### Task Tracking — Trello
The team used a **Trello board** to organize and track all tasks. Cards were created for each feature and module, assigned to the responsible team member, and moved across columns (To Do → In Progress → Done) as work progressed. This gave everyone a clear view of what was being worked on and what was pending.

### Communication — Discord
The team communicated via **Discord** with dedicated channels for backend, frontend, DevOps, and general discussion. Discord was used for daily coordination, sharing progress updates, unblocking each other, and making decisions on technical approaches.

### Version Control — GitHub Branches
The team used **GitHub with a branch-per-feature workflow**. Each team member worked on their own branch named after the feature they were implementing. Branches were merged into the main branch once the feature was complete and reviewed by at least one other team member.

### Task Distribution
| Domain | Responsible |
|--------|------------|
| Core backend, auth, APIs, database | Houdaifa Drahm |
| Frontend pages, components, game UI | Ahmed Ahlaqqach |
| DevOps, Docker, Nginx, monitoring, ELK | Mohamed Mazouz |
| AI opponent, profile edit, contact page | Youssef Akhadad |

---

## Technical Stack

### Backend
| Technology | Version | Why chosen |
|-----------|---------|-----------|
| **NestJS** | 11 | Provides a structured, modular architecture with built-in dependency injection, guards, interceptors, and decorators — ideal for a large-scale project requiring clear separation of concerns. Chosen over plain Express for its TypeScript-first design and enterprise-grade patterns. |
| **TypeORM** | latest | Integrates natively with NestJS and TypeScript, provides entity-based schema definition, and supports complex relations (one-to-many, many-to-many) with a clean decorator syntax. Chosen over Prisma for its mature ecosystem and NestJS integration. |
| **PostgreSQL** | 16 | Relational database with strong consistency guarantees, excellent support for complex joins and transactions — critical for chat threading, friend relations, and game records. Chosen over MongoDB for its relational integrity. |
| **socket.io** | latest | Provides reliable real-time bidirectional communication with automatic reconnection, room management, and fallback transport — essential for live game state streaming and chat presence. |
| **Passport.js** | latest | Pluggable authentication middleware for NestJS supporting local (email/password), JWT, and multiple OAuth2 strategies (Google, GitHub, 42) with a unified interface. |
| **nestjs-pino** | latest | Structured JSON logging with automatic request context, log levels, and sensitive field redaction — production-ready logging with minimal configuration. |
| **class-validator** | latest | Declarative DTO validation using decorators, integrated with NestJS ValidationPipe for automatic whitelist enforcement on all incoming requests. |

### Frontend
| Technology | Version | Why chosen |
|-----------|---------|-----------|
| **React 18** | 18 | Component-based UI framework with hooks for state and side-effects, large ecosystem, and strong community. Considered a framework in this context per subject definition. |
| **Vite** | latest | Extremely fast dev server with HMR and optimized production builds. Chosen over Create React App for speed and modern ESM-based architecture. |
| **socket.io-client** | latest | Matches the backend socket.io server for seamless real-time communication in chat and game namespaces. |
| **HTML5 Canvas** | native | Used for rendering the four themed game modes (Joker, Kitty Cat, Soul Society, Zombie Land) with custom animated backgrounds and physics-accurate paddle/puck rendering. |

### DevOps & Infrastructure
| Technology | Why chosen |
|-----------|-----------|
| **Docker + Docker Compose** | Single-command deployment of all services (backend, frontend, Postgres, Nginx, ELK, Prometheus, Grafana). Guarantees identical environments across dev and prod. |
| **Nginx** | Reverse proxy that terminates TLS, serves the React SPA, and proxies `/api` and `/socket.io` to the backend — provides HTTPS enforcement and load balancing capability. |
| **Prometheus** | Pull-based metrics collection with a custom `/metrics` endpoint exposing counters and gauges for logins, active games, messages, queue size, and registrations. |
| **Grafana** | Visualization layer for Prometheus metrics with custom dashboards and alerting rules. Chosen for its rich dashboard ecosystem and Prometheus-native integration. |
| **ELK Stack** | Elasticsearch stores and indexes backend logs, Logstash collects and transforms them, Kibana provides visualization — full log observability in production. |

---

## Database Schema

### User
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, generated | Unique user identifier |
| email | varchar | UNIQUE, NOT NULL | Login email address |
| username | varchar(20) | UNIQUE, NOT NULL | Display handle (lowercased) |
| firstName | varchar | nullable | Profile first name |
| lastName | varchar | nullable | Profile last name |
| password | text | nullable, bcrypt | Hashed password (null for OAuth-only users) |
| googleId | varchar | UNIQUE, nullable | Google OAuth ID |
| githubId | varchar | UNIQUE, nullable | GitHub OAuth ID |
| intra42Id | varchar | UNIQUE, nullable | 42 Intra OAuth ID |
| avatarUrl | text | nullable | Public path to avatar file |
| wins | int | default 0 | Total game wins |
| losses | int | default 0 | Total game losses |
| level | int | default 1 | Current XP level |
| points | float | default 0 | Ranking points |
| totalXp | float | default 0 | Cumulative experience points |
| winrate | float | default 0 | Win percentage |
| rank | varchar | nullable | Cosmetic rank label |
| favouriteGame | varchar | nullable | Most played game mode |
| refreshTokenHash | text | nullable | Hashed refresh token for rotation |
| resetPasswordTokenHash | text | nullable | Hashed password reset token |
| resetPasswordExpiresAt | timestamptz | nullable | Reset token expiration |
| isActive | bool | default true | Soft-active flag |
| createdAt | timestamptz | auto | Account creation timestamp |
| updatedAt | timestamptz | auto | Last update timestamp |

**Relations:**
- One User → Many FriendRequests (as requester and receiver)
- One User → Many Blocks (as blocker and blocked)
- One User → Many Messages (as sender)
- One User → Many MessageReactions
- One User → Many Games (as playerA, playerB, or winner)
- Many Users ↔ Many Conversations (participants)

---

### Game
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, generated | Unique game identifier |
| mode | enum (GameModeEnum) | NOT NULL | SOUL_SOCIETY / ZOMBIE_LAND / BARBIE_PINK / JOKER |
| status | enum (GameStatusEnum) | NOT NULL | FINISHED / ABORTED / etc. |
| playerA | uuid | FK → User, NOT NULL | First player |
| playerB | uuid | FK → User, NOT NULL | Second player |
| winner | uuid | FK → User, nullable | Winner of the game |
| playerAScore | int | NOT NULL | Player A final score |
| playerBScore | int | NOT NULL | Player B final score |
| playerAXpEarned | float | default 0 | XP awarded to player A |
| playerBXpEarned | float | default 0 | XP awarded to player B |
| createdAt | timestamptz | auto | Game start timestamp |

**Relations:**
- Many Games → One User (playerA)
- Many Games → One User (playerB)
- Many Games → One User (winner)

---

### Conversation
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, generated | Unique conversation identifier |
| name | varchar | nullable | Name for global/group conversations |
| isGroup | bool | default false | True for global room, false for DM |
| createdAt | timestamptz | auto | Creation timestamp |

**Relations:**
- Many Conversations ↔ Many Users (participants, many-to-many)
- One Conversation → Many Messages (cascade delete)

---

### Message
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, generated | Unique message identifier |
| content | text | NOT NULL | Message body |
| sender | uuid | FK → User, NOT NULL | Message author |
| conversation | uuid | FK → Conversation, NOT NULL, cascade delete | Parent conversation |
| replyTo | uuid | FK → Message, nullable, set null | Reply threading reference |
| createdAt | timestamptz | auto, indexed | Send timestamp |

**Relations:**
- Many Messages → One Conversation
- Many Messages → One User (sender)
- Many Messages → One Message (replyTo, self-referential)
- One Message → Many MessageReactions (cascade delete)

---

### MessageReaction
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, generated | Unique reaction identifier |
| emoji | varchar(16) | NOT NULL | Emoji code |
| message | uuid | FK → Message, cascade delete | Target message |
| user | uuid | FK → User, cascade delete | Reactor |
| createdAt | timestamptz | auto | Reaction timestamp |

---

### FriendRequest
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, generated | Unique request identifier |
| requesterId | uuid | FK → User, UNIQUE pair | Request sender |
| receiverId | uuid | FK → User, UNIQUE pair | Request receiver |
| status | varchar | default 'PENDING' | PENDING / ACCEPTED / REJECTED |
| createdAt | timestamptz | auto | Request timestamp |

---

### Block
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, generated | Unique block identifier |
| blockerId | uuid | FK → User, UNIQUE pair | User who blocked |
| blockedId | uuid | FK → User, UNIQUE pair | Blocked user |
| createdAt | timestamptz | auto | Block timestamp |

---

## Features List

| Feature | Description | Implemented By |
|---------|-------------|----------------|
| Local authentication | Email/password signup and login with bcrypt hashing, JWT access token (in-memory) and refresh token (httpOnly cookie) | Houdaifa Drahm |
| OAuth2 login | Google, GitHub, and 42 Intra OAuth2 strategies with automatic account creation | Houdaifa Drahm |
| JWT refresh rotation | Secure token rotation on each refresh request, old token invalidated | Houdaifa Drahm |
| Password reset via email | Secure reset token generation, email sent via Resend API, token expiry enforced | Houdaifa Drahm |
| User profile page | Displays avatar, username, stats (wins/losses/level/XP/winrate), favorite game mode | Ahmed Ahlaqqach |
| Profile edit | Update username, first name, last name, and avatar upload with file validation | Youssef Akhadad |
| Avatar upload | Multipart file upload with type/size validation, stored under /uploads/avatars | Youssef Akhadad |
| Friend requests | Send, accept, reject friend requests; view friends list with online status | Houdaifa Drahm |
| User blocking | Block/unblock users; blocked users filtered from chat and friend list | Houdaifa Drahm |
| Online presence | Real-time presence tracking via socket connection/disconnection events | Houdaifa Drahm |
| Global chat | Public chat room with real-time messaging, reactions, and pagination | Houdaifa Drahm |
| Direct messages | Private DM conversations between two users with message history | Houdaifa Drahm |
| Message reactions | Emoji reactions on messages with real-time updates to all participants | Houdaifa Drahm |
| Message replies | Reply-to threading with reference to original message | Houdaifa Drahm |
| Typing indicators | Real-time typing indicator visible to other participants | Ahmed Ahlaqqach |
| Chat UI | Full chat interface with global/DM tabs, emoji picker, reply display | Ahmed Ahlaqqach |
| Game lobby | Mode selection (Joker/Kitty/Soul/Zombie), matchmaking queue, ready check | Ahmed Ahlaqqach |
| Real-time game | Physics-based air-hockey engine with paddle and puck rendered on HTML5 canvas | Ahmed Ahlaqqach |
| Themed game modes | Four distinct visual themes with animated backgrounds and unique aesthetics | Ahmed Ahlaqqach |
| Remote multiplayer | Two players on separate computers matched via queue, game state synced via WebSocket | Houdaifa Drahm |
| AI opponent | Physics-based AI paddle with easy/hard difficulty, simulates human-like reaction time | Youssef Akhadad |
| In-game forfeit | Player can forfeit mid-game, opponent wins automatically | Houdaifa Drahm |
| XP and leveling | XP awarded on game completion based on result, level thresholds calculated server-side | Houdaifa Drahm |
| Leaderboard | Infinite-scroll leaderboard ranked by points with search and filter | Ahmed Ahlaqqach |
| Match history | Per-user match history with mode, opponent, score, date, result | Ahmed Ahlaqqach |
| Contact page | Contact form with frontend UI and backend handler | Youssef Akhadad |
| Health checks | GET /health (liveness + DB) and GET /health/ready (DB + external pings + memory + disk) via Terminus | Houdaifa Drahm |
| Prometheus metrics | Custom counters/gauges for logins, registrations, active games, messages, queue size | Houdaifa Drahm |
| Grafana dashboards | Custom dashboards visualizing all Prometheus metrics with alerting rules | Mohamed Mazouz |
| ELK logging | Backend logs shipped to Logstash → Elasticsearch, visualized in Kibana | Mohamed Mazouz |
| Docker deployment | Single-command deployment via docker-compose for dev, prod, and monitoring stacks | Mohamed Mazouz |
| Nginx reverse proxy | TLS termination, SPA serving, /api and /socket.io proxying | Mohamed Mazouz |
| Advanced search | User and leaderboard search with filters, sorting, and pagination | Houdaifa Drahm |
| Multi-browser support | Tested and compatible with Chrome, Firefox, and Safari | Ahmed Ahlaqqach |
| Privacy Policy & ToS | Accessible pages from app footer with relevant content | Ahmed Ahlaqqach |

---

## Modules

| # | Module | Type | Points | Implemented By | Justification |
|---|--------|------|--------|----------------|---------------|
| 1 | **Web-based game** | Major | 2 | Ahmed Ahlaqqach, Houdaifa Drahm | Real-time air-hockey game with four themed modes rendered on HTML5 canvas. Players compete in live matches with clear win/loss conditions (first to 5 points). Game state (puck physics, paddle positions, scores) is computed server-side and streamed via WebSocket. Fully satisfies: real-time multiplayer, clear rules, live matches. |
| 2 | **Remote players** | Major | 2 | Houdaifa Drahm | Two players on separate computers matched via a server-side queue. Game state synchronized via socket.io with server-authoritative physics. Disconnection is handled gracefully (gameAborted event), reconnection logic present. Network latency managed via server-side tick rate. |
| 3 | **Frontend + Backend frameworks** | Major | 2 | Ahmed Ahlaqqach, Houdaifa Drahm | Frontend: React 18 (component architecture, hooks, routing, state management, ecosystem). Backend: NestJS 11 (modular architecture, DI, decorators, guards, interceptors). Both are full frameworks per subject definition. |
| 4 | **Real-time features (WebSockets)** | Major | 2 | Houdaifa Drahm | socket.io gateways handle: chat messages, emoji reactions, presence updates, matchmaking events, game state streaming, ready checks, and forfeit. All events broadcast efficiently to relevant rooms. Connection/disconnection handled gracefully with cleanup. |
| 5 | **User interaction (chat + profiles + friends)** | Major | 2 | Houdaifa Drahm, Ahmed Ahlaqqach | Complete social layer: global chat room, DM conversations, user profile pages with stats, friend request system (send/accept/reject), friends list with online status. All three minimum requirements (chat, profiles, friends) fully implemented. |
| 6 | **Standard user management** | Major | 2 | Houdaifa Drahm, Youssef Akhadad | Users can update profile information (username, firstname, lastname via Youssef's edit page), upload avatars with default fallback, add friends and view their online status, and view profile pages with all stats. All four requirements met. |
| 7 | **ELK Stack** | Major | 2 | Mohamed Mazouz | Elasticsearch stores and indexes all backend logs with ILM retention policies. Logstash collects logs from the NestJS pino logger and transforms them. Kibana provides visualization dashboards. All components secured and deployed via Docker Compose in infra/elk. |
| 8 | **Prometheus & Grafana** | Major | 2 | Mohamed Mazouz, Houdaifa Drahm | Prometheus scrapes /metrics endpoint (implemented by Houdaifa) collecting: login counter, registration counter, active games gauge, queue size gauge, messages sent counter, completed games counter, chat WebSocket connections gauge. Grafana (Mohamed) provides custom dashboards and alerting rules with secured access. |
| 9 | **AI Opponent** | Major | 2 | Youssef Akhadad | Implemented in game.service.ts: physics-based AI paddle that tracks puck trajectory with reaction time variance to simulate human behavior. Easy mode: slower reaction, higher error margin. Hard mode: faster reaction, tighter tracking. AI can win matches. Fully explained and demonstrable. |
| 10 | **Advanced chat features** | Minor | 1 | Houdaifa Drahm, Ahmed Ahlaqqach | Block users from messaging (filter applied in chat gateway), invite users to play directly from chat, game/tournament notifications in chat, access to user profiles from chat interface, chat history persistence in Postgres, typing indicators and message read state. All six features implemented. |
| 11 | **Gamification system** | Minor | 1 | Houdaifa Drahm | XP/level system (tracked in User entity, updated on game completion), leaderboard ranked by points (persistent in DB), win rate tracking (calculated and stored). Three features fully implemented and persistent. Visual feedback provided via leaderboard page and profile stats display. |
| 12 | **ORM (TypeORM)** | Minor | 1 | Houdaifa Drahm | TypeORM used for all database interactions: entity definitions, repository pattern, relations (one-to-many, many-to-many), query builder for complex queries. Eliminates raw SQL, provides type safety, and integrates natively with NestJS. |
| 13 | **Advanced search functionality** | Minor | 1 | Houdaifa Drahm | User search with filters (by username, stats), sorting (by points, level, winrate), and pagination (cursor-based infinite scroll on leaderboard). Implemented in UserService with TypeORM query builder. |
| 14 | **Additional browser support** | Minor | 1 | Ahmed Ahlaqqach | Application tested and verified compatible on Google Chrome (primary), Mozilla Firefox, and Safari. CSS layout, canvas rendering, WebSocket connections, and OAuth flows validated across all three browsers. Browser-specific quirks documented. |
| 15 | **OAuth 2.0 remote authentication** | Minor | 1 | Houdaifa Drahm | Three OAuth2 providers implemented via Passport.js strategies: Google (passport-google-oauth20), GitHub (passport-github2), and 42 Intra (passport-42). Each strategy creates or links a user account and issues JWT tokens on success. Callback URLs configurable via env. |
| 16 | **Game statistics and match history** | Minor | 1 | Houdaifa Drahm, Ahmed Ahlaqqach | Game records persisted in Game entity with mode, scores, winner, XP earned, timestamps. Stats endpoint returns wins, losses, level, XP, winrate, favorite mode. Match history endpoint returns paginated list of past games with opponent info. Leaderboard integrated with stats. |
| 17 | **Health check & status page** | Minor | 1 | Houdaifa Drahm, Mohamed Mazouz | Terminus health checks at GET /health (liveness: app up + DB reachable) and GET /health/ready (DB connection, Google/GitHub external pings, memory heap < 300MB, disk usage < 90%). Automated database backups configured in DevOps stack with disaster recovery procedures documented. |

### Point Calculation

| Category | Count | Points each | Subtotal |
|----------|-------|-------------|---------|
| Major modules | 9 | 2 pts | 18 pts |
| Minor modules | 8 | 1 pt | 8 pts |
| **TOTAL** | **17 modules** | | **26 pts** |

---

## Individual Contributions

### Houdaifa Drahm — Tech Lead

**Files and services owned:**
- `backend_srcs/src/auth/` — complete authentication module: local strategy, JWT strategy, Google/GitHub/42 OAuth strategies, AuthGuard, JwtRefreshGuard, auth controller, auth service
- `backend_srcs/src/user/` — user service (profile CRUD, friends system, blocking, search, stats), user controller, user entity
- `backend_srcs/src/chat/` — chat gateway (WebSocket), chat service, conversation and message management
- `backend_srcs/src/game/` — game gateway, game service (matchmaking queue, game sessions, scoring, XP awards)
- `backend_srcs/src/metrics/` — Prometheus metrics module, custom counters and gauges
- `backend_srcs/src/health/` — Terminus health check module
- `backend_srcs/src/email/` — email service via Resend API for password reset
- `backend_srcs/src/main.ts` — app bootstrap, ValidationPipe, CORS, cookie-parser, ClassSerializerInterceptor
- All TypeORM entity files: User, Game, Conversation, Message, MessageReaction, FriendRequest, Block

**Modules implemented:** Remote players, Real-time WebSockets, User interaction, Standard user management, ORM, Advanced search, OAuth 2.0, Game statistics, Health check, Prometheus & Grafana (metrics endpoint), AI Opponent (game gateway integration)

**Challenges:** Implementing secure JWT refresh token rotation while preventing token reuse attacks required hashing the refresh token in the database and invalidating it on every rotation. Designing the WebSocket game loop to be server-authoritative while keeping latency acceptable required careful tick rate tuning and delta compression of game state.

---

### Ahmed Ahlaqqach — Product Owner (PO)

**Files and components owned:**
- `netpong-app/src/pages/` — all page components: Login, Signup, Home/Dashboard, Chat, Profile, Leaderboard, History, GamePlay (all 4 modes), PasswordReset, OAuthCallback, NotFound, PrivacyPolicy, TermsOfService
- `netpong-app/src/components/` — all reusable UI components: chat bubbles, message input, game canvas renderers (JokerCanvas, KittyCanvas, SoulCanvas, ZombieCanvas), leaderboard table, profile card, nav bar
- `netpong-app/src/utils/api.js` — fetch wrappers with auth token injection and refresh logic
- Socket.io client integration for chat and game namespaces
- Responsive CSS layouts and themed styling for all four game modes

**Modules implemented:** Web-based game (canvas renderers), Frontend framework, Advanced chat features (UI), Game statistics UI, Additional browser support, Multi-browser testing

**Challenges:** Building four visually distinct game canvas renderers with animated backgrounds while maintaining 60fps performance required careful use of requestAnimationFrame and canvas layer separation. Handling in-memory JWT tokens with automatic silent refresh on 401 responses required a custom `authFetch` wrapper that transparently retries failed requests after token refresh, and falls back to redirecting to login if the refresh token is also expired.

---

### Mohamed Mazouz — Project Manager (PM) + DevOps Engineer

**Files and configurations owned:**
- `infra/compose/docker-compose.dev.yml` — development stack with hot reload
- `infra/compose/docker-compose.prod.yml` — production stack with TLS
- `infra/compose/docker-compose.monitoring.yml` — Prometheus + Grafana + Alertmanager stack
- `infra/nginx/` — Nginx config with TLS termination, SPA serving, /api and /socket.io proxying
- `infra/elk/` — Elasticsearch ILM policy, Logstash pipeline config, Kibana dashboards
- `infra/env/` — all .env.example files for backend, database, nginx, game, monitoring
- All Dockerfiles for backend and frontend services
- Prometheus alerting rules and Grafana dashboard JSON exports
- Automated backup scripts and disaster recovery procedures

**Modules implemented:** ELK Stack, Prometheus & Grafana (infrastructure), Health check (DevOps side), containerization/deployment

**Challenges:** Configuring Logstash to correctly parse NestJS pino JSON logs and forward them to Elasticsearch required custom grok patterns and field mappings. Setting up Nginx to correctly proxy WebSocket upgrade requests (socket.io) alongside regular HTTP traffic required specific proxy_set_header and proxy_http_version directives.

---

### Youssef Akhadad — Developer

**Files and features owned:**
- `backend_srcs/src/game/game.service.ts` — AI opponent logic: physics simulation of puck trajectory prediction, paddle movement algorithm with difficulty-based reaction time variance, human-like error injection on easy mode
- `backend_srcs/src/user/` — profile update endpoint (PATCH /user/profile): username, firstname, lastname, avatar upload handling
- `netpong-app/src/pages/ProfileEdit.jsx` — profile edit page with form validation, avatar preview, and upload progress
- `netpong-app/src/pages/Contact.jsx` — contact page frontend
- `backend_srcs/src/contact/` — contact page backend handler

**Modules implemented:** AI Opponent, Standard user management (profile edit + avatar), Web-based game (AI integration)

**Challenges:** Designing the AI to be challenging but not perfect required implementing a prediction algorithm that calculates puck intercept position while intentionally missing by a random margin on easy difficulty. Balancing the AI so it wins occasionally (as required by the subject) without being frustrating required extensive playtesting and tuning of the reaction delay parameters.

---

## Instructions

### Prerequisites
- Docker Engine 24+
- Docker Compose v2+
- OpenSSL (for generating TLS certificates if needed)
- Node.js 18+ (only needed for local development without Docker)

### Environment Setup

Copy the example env files and fill in the required values:

```bash
cp infra/env/backend.env.example infra/env/backend.env
cp infra/env/database.env.example infra/env/database.env
```

**Required variables in `backend.env`:**
```
JWT_ACCESS_SECRET=<your-secret>
JWT_REFRESH_SECRET=<your-secret>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CORS_ORIGINS=https://localhost:8080,http://localhost:8080
FRONTEND_URL=http://localhost:5173
DB_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=netpong
POSTGRES_USER=netpong
POSTGRES_PASSWORD=<your-password>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALL_BACK_URL=https://localhost:8080/api/auth/google/callback
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
GITHUB_CALL_BACK_URL=https://localhost:8080/api/auth/github/callback
INTRA_42_CLIENT_ID=<your-42-client-id>
INTRA_42_CLIENT_SECRET=<your-42-client-secret>
INTRA_42_CALL_BACK_URL=https://localhost:8080/api/auth/42/callback
RESEND_API_KEY=<your-resend-api-key>
RESEND_FROM=noreply@yourdomain.com
```

**Required variables in `database.env`:**
```
POSTGRES_DB=netpong
POSTGRES_USER=netpong
POSTGRES_PASSWORD=<your-password>
POSTGRES_PORT=5432
```

### Run — Development

```bash
docker compose -f infra/compose/docker-compose.dev.yml \
  --env-file infra/env/backend.env \
  --env-file infra/env/database.env \
  up --build
```

Access the app at: `http://localhost:8080`  
Backend API available at: `http://localhost:8080/api`

### Run — Production

```bash
docker compose -f infra/compose/docker-compose.prod.yml \
  --env-file infra/env/backend.env \
  --env-file infra/env/database.env \
  up -d --build
```

Ensure TLS certificates are placed under `infra/nginx/certs/` before running production.  
Access the app at: `https://yourdomain.com`

### Run — Monitoring Stack (Prometheus + Grafana + ELK)

```bash
docker compose -f infra/compose/docker-compose.monitoring.yml up -d
```

- Grafana: `http://localhost:3001`
- Kibana: `http://localhost:5601`
- Prometheus: `http://localhost:9090`

### Local Development (without Docker)

**Backend:**
```bash
cd backend_srcs
npm install
# Start a local Postgres instance or use the Docker one
npm run start:dev
```

**Frontend:**
```bash
cd netpong-app
npm install
npm run dev -- --host --port 5173
```

---

## Security & Compliance

- **HTTPS:** All connections enforced via Nginx TLS termination. Backend never exposed directly; all traffic goes through Nginx which terminates SSL.
- **Password security:** Passwords hashed with bcrypt (via Passport local strategy). Salt generated automatically per user. Plain text passwords never stored or logged.
- **JWT security:** Access token stored in-memory via a module-level variable (`getToken`/`setToken` in authToken.js), never in localStorage — protecting against XSS token theft. Refresh token stored as an httpOnly + Secure cookie (sent automatically by the browser via `credentials: 'include'`), making it inaccessible to JavaScript. All API calls go through `authFetch`, which transparently retries with a refreshed token on 401 responses. If refresh fails, the session is cleared and the user is redirected to login. User session metadata stored in sessionStorage (cleared on tab close).
- **Input validation:** All incoming requests validated server-side via NestJS `ValidationPipe` with whitelist mode (strips unknown fields). Frontend validates all forms before submission.
- **Environment secrets:** All credentials stored in `.env` files. `.env` files are gitignored. `.env.example` files provided in `infra/env/` for all services.
- **Privacy Policy & Terms of Service:** Both pages are accessible from the application footer and contain relevant, project-specific content.
- **Multi-user support:** The application supports multiple simultaneous users. WebSocket rooms isolate game sessions and chat conversations. Postgres transactions prevent race conditions on concurrent writes (friend requests, game records).
- **Browser compatibility:** Fully tested and compatible with the latest stable versions of Google Chrome, Mozilla Firefox, and Safari. No console errors or warnings in Chrome DevTools.

---

## Resources

### Official Documentation
- [NestJS Documentation](https://docs.nestjs.com)
- [React Documentation](https://react.dev)
- [TypeORM Documentation](https://typeorm.io)
- [socket.io Documentation](https://socket.io/docs/v4)
- [Passport.js Documentation](https://www.passportjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/16)
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview)
- [Grafana Documentation](https://grafana.com/docs/grafana/latest)
- [Elastic Stack Documentation](https://www.elastic.co/guide/index.html)
- [Docker Documentation](https://docs.docker.com)
- [Nginx Documentation](https://nginx.org/en/docs)
- [JWT.io](https://jwt.io/introduction)
- [OAuth 2.0 RFC](https://datatracker.ietf.org/doc/html/rfc6749)

### How AI Was Used in This Project

AI tools (primarily Claude and GitHub Copilot) were used during development for the following specific tasks:

- **Boilerplate generation:** Generating initial NestJS module, controller, and service scaffolding to speed up repetitive setup.
- **TypeORM entity design:** Getting suggestions for entity relationship patterns (many-to-many join tables, self-referential relations for friend requests).
- **Debugging:** Explaining TypeScript type errors and NestJS DI resolution errors encountered during development.
- **Documentation:** Assisting with writing this README structure and inline code comments.
- **Algorithm ideas:** Brainstorming the AI opponent puck-prediction algorithm, which was then implemented, tested, and significantly modified by the team.

All AI-generated content was reviewed, tested, and validated by the team before inclusion. No AI-generated code was used without full understanding of its behavior.