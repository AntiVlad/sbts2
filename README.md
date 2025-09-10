
## Quick Start
1) Create env file

Copy `.env.example` to `.env` and adjust if needed.

2) Install dependencies

```bash
npm install
```

3) Generate/migrate database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4) Run dev server

```bash
npm run dev
```

- Admin: http://localhost:3000/admin

