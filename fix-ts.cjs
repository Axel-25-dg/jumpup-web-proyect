const fs = require('fs');

const fixImport = (file, search) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(new RegExp('import { ' + search, 'g'), 'import type { ' + search);
    content = content.replace(new RegExp('import { ' + search + ' }', 'g'), 'import type { ' + search + ' }');
    fs.writeFileSync(file, content);
  }
};

const replaceText = (file, search, replace) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.split(search).join(replace);
    fs.writeFileSync(file, content);
  }
};

// domain ports
fixImport('src/domain/ports/classroom.repository.ts', 'ClassroomStudent');
fixImport('src/domain/ports/classroom.repository.ts', 'PaginatedResult');
fixImport('src/domain/ports/live-session.repository.ts', 'LiveSession');
fixImport('src/domain/ports/live-session.repository.ts', 'PaginatedResult');
fixImport('src/domain/ports/message.repository.ts', 'Contact');
fixImport('src/domain/ports/message.repository.ts', 'Message');
fixImport('src/domain/ports/resource.repository.ts', 'Resource');
fixImport('src/domain/ports/resource.repository.ts', 'PaginatedResult');

// infrastructure adapters
fixImport('src/infrastructure/adapters/axios-classroom.repository.ts', 'ClassroomRepository');
fixImport('src/infrastructure/adapters/axios-classroom.repository.ts', 'Classroom');
fixImport('src/infrastructure/adapters/axios-classroom.repository.ts', 'ClassroomStudent');
fixImport('src/infrastructure/adapters/axios-classroom.repository.ts', 'PaginatedResult');
fixImport('src/infrastructure/adapters/axios-live-session.repository.ts', 'LiveSessionRepository');
fixImport('src/infrastructure/adapters/axios-live-session.repository.ts', 'LiveSession');
fixImport('src/infrastructure/adapters/axios-live-session.repository.ts', 'PaginatedResult');
fixImport('src/infrastructure/adapters/axios-message.repository.ts', 'MessageRepository');
fixImport('src/infrastructure/adapters/axios-message.repository.ts', 'Contact');
fixImport('src/infrastructure/adapters/axios-message.repository.ts', 'Message');
fixImport('src/infrastructure/adapters/axios-resource.repository.ts', 'ResourceRepository');
fixImport('src/infrastructure/adapters/axios-resource.repository.ts', 'Resource');
fixImport('src/infrastructure/adapters/axios-resource.repository.ts', 'PaginatedResult');

// presentation pages
fixImport('src/presentation/pages/teacher/classrooms/ManageClassroomPage.tsx', 'ClassroomStudent');
fixImport('src/presentation/pages/teacher/inbox/TeacherInboxPage.tsx', 'Contact, Message');
fixImport('src/presentation/pages/teacher/live/ManageLiveSessionsPage.tsx', 'LiveSession');
fixImport('src/presentation/pages/teacher/resources/ResourceLibraryPage.tsx', 'Resource');

// replace align=\"end\"
replaceText('src/presentation/pages/teacher/live/ManageLiveSessionsPage.tsx', 'align=\"end\"', '');
replaceText('src/presentation/pages/teacher/resources/ResourceLibraryPage.tsx', 'align=\"end\"', '');

// replace user.id with user.user_id
replaceText('src/presentation/pages/teacher/inbox/TeacherInboxPage.tsx', 'user.id', 'user.user_id');
replaceText('src/presentation/pages/teacher/inbox/TeacherInboxPage.tsx', 'user?.id', 'user?.user_id');

replaceText('src/presentation/pages/teacher/live/ManageLiveSessionsPage.tsx', 'user.id', 'user.user_id');
replaceText('src/presentation/pages/teacher/live/ManageLiveSessionsPage.tsx', 'user?.id', 'user?.user_id');

replaceText('src/presentation/pages/teacher/resources/ResourceLibraryPage.tsx', 'user.id', 'user.user_id');
replaceText('src/presentation/pages/teacher/resources/ResourceLibraryPage.tsx', 'user?.id', 'user?.user_id');

// remove unused imports
replaceText('src/presentation/pages/teacher/TeacherDashboardPage.tsx', '  Clock,\n', '');
replaceText('src/presentation/pages/teacher/inbox/TeacherInboxPage.tsx', 'CardContent ', '');
replaceText('src/presentation/pages/teacher/classrooms/CreateClassroomPage.tsx', '  ImageIcon,\n', '');
replaceText('src/presentation/pages/teacher/classrooms/CreateClassroomPage.tsx', '  CheckCircle2,\n', '');

// fix textarea e: any -> e: any is fine, wait I need to fix e: any to e: React.ChangeEvent
replaceText('src/presentation/pages/teacher/classrooms/CreateClassroomPage.tsx', '(e) =>', '(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>');
replaceText('src/presentation/pages/teacher/courses/CreateCoursePage.tsx', '(e) =>', '(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>');
replaceText('src/presentation/pages/teacher/courses/CreateLessonPage.tsx', '(e) =>', '(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>');
replaceText('src/presentation/pages/teacher/courses/CreateModulePage.tsx', '(e) =>', '(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>');
replaceText('src/presentation/pages/teacher/profile/TeacherProfilePage.tsx', '(e) =>', '(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>');

// fix Textarea import inside components/ui/textarea.tsx
replaceText('src/presentation/components/ui/textarea.tsx', 'import { cn } from \"@/lib/utils\"', 'const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(\" \")');

console.log('done')
