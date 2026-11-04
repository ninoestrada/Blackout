  <h3 align="center" style="font-size: 2.1em; font-weight: bolder;">Blackout</h3>

  <p align="center">
    A creative workspace for making and saving blackout poetry.
    <br />
    <br />
    <a href="https://github.com/ninoestrada/Blackout/issues/new">Report Bug</a>
    ·
    <a href="https://github.com/ninoestrada/Blackout/issues/new">Request Feature</a>
  </p>

![Blackout Homepage](images/blackout-homepage.png)

<!-- ABOUT THE PROJECT -->

## 📖 About the Project

**Blackout** is a quiet tool for uncovering meaning inside existing language. You begin with a page of text. You conceal most of it. What remains becomes the poem.

### ✨ Features

- Create poems by blacking out words from existing text.
- Draw on poems using different colors and brush sizes.
- Undo and redo blackout and drawing edits.
- Sign in with Google to save, edit, and manage poems.
- Export poems as PNG images.

<!-- DEFINITION -->

## 🖋 What is Blackout Poetry?

Blackout poetry is a form of found poetry where you take an existing text and remove most of it,
leaving selected words visible to form a new meaning or message.

### **🛠️ Tech Stack**

|                    Front-End                    |                 Back-End                  |
| :---------------------------------------------: | :---------------------------------------: |
| [![TypeScript][TypeScript.com]][TypeScript-url] | [![Supabase][Supabase.com]][Supabase-url] |
|        [![React][React.com]][React-url]         | [![Postgres][Postgres.com]][Postgres-url] |
| [![Next.js][Next.js.com]][Next.js-url]          |                                           |

## 🏗️ Architecture

![Blackout System Architecture](images/architecture.jpg)

<!-- GETTING STARTED -->

## 📦 Getting Started

### **💾 Installation**

1. Clone the repository and navigate to the project directory
   ```sh
   git clone https://github.com/ninoestrada/Blackout.git
   cd Blackout
   ```
2. Install dependencies
   ```sh
   npm install
   ```
3. Create a project in the [Supabase dashboard](https://supabase.com/dashboard).
4. Create a `.env.local` file in the project root and add your Supabase project URL and publishable key from the dashboard.
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
   ```
5. Set up the database using the SQL files in `supabase/migrations`.
6. Configure Google sign-in through Supabase Authentication.

### **▶️ Running the Program**

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser, or use the local URL shown in your terminal.

### **🧪 Tests**

```sh
npm test
```

<!-- LICENSE -->

## 📜 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

<!------- MARKDOWN LINKS & IMAGES ------->

[React.com]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
[TypeScript.com]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Next.js.com]: https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next.js-url]: https://nextjs.org/
[Supabase.com]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.com/
[Postgres.com]: https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white
[Postgres-url]: https://www.postgresql.org/
