<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization -->
- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
	<!-- Requirements clarified: Build upgraded PDF manipulation web app -->

- [x] Scaffold the Project
	<!-- Next.js project scaffolded with TypeScript, Tailwind, ESLint, App Router -->

- [x] Customize the Project
	<!-- Implemented PDF merge functionality with client-side upload and API processing -->

- [ ] Install Required Extensions
	<!-- No specific extensions required -->

- [x] Compile the Project
	<!-- Dependencies installed, project compiles without errors -->

- [ ] Create and Run Task
	<!-- Dev server runs with npm run dev -->

- [ ] Launch the Project
	<!-- Ready for launch -->

- [x] Ensure Documentation is Complete
	<!-- README.md created, instructions updated -->

## Project Architecture

This is a Next.js 15 web application using the App Router for building a PDF manipulation tool suite, upgraded from ilovepdf.com style apps.

### Key Components
- **Frontend**: React components in `app/` with Tailwind CSS styling
- **Backend**: API routes in `app/api/` for server-side PDF processing
- **PDF Processing**: Uses `pdf-lib` library for document manipulation

### File Structure
- `app/page.tsx`: Main landing page with tool cards and file upload UI
- `app/api/merge/route.ts`: API endpoint for merging multiple PDFs
- `app/layout.tsx`: Root layout with metadata
- `app/globals.css`: Global styles with Tailwind imports

### Development Workflow
- Start development server: `npm run dev` (runs on localhost:3000)
- Build for production: `npm run build`
- Lint code: `npm run lint`

### PDF Operations
- **Merge PDFs**: POST to `/api/merge` with FormData containing 'files' array
  - Validates at least 2 PDF files
  - Returns merged PDF as attachment download
- Client-side file selection uses hidden `<input type="file" multiple>` with label triggers

### Code Patterns
- API routes use async/await with try/catch for error handling
- File uploads processed as FormData, converted to ArrayBuffer for pdf-lib
- Client components use React hooks (useState) for state management
- Error handling: Alert dialogs for user feedback, console.error for logging

### Dependencies
- `pdf-lib`: Core PDF manipulation library
- `next`: React framework with App Router
- `react` & `react-dom`: UI library
- `tailwindcss`: Utility-first CSS framework
- `typescript`: Type safety
- `eslint`: Code linting

### Future Extensions
- Add split, compress, protect/unlock APIs following merge pattern
- Implement conversion to other formats (requires additional libraries)
- Add drag-and-drop with react-dropzone
- Integrate preview with pdfjs-dist
- Add authentication and cloud storage

<!-- Execution Guidelines... (removed for brevity) -->