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

const fixUseCases = (file, repoType) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Fix imports
    content = content.replace(/import { (.*?) }/g, 'import type { $1 }');
    
    // Fix constructor
    content = content.replace(
      new RegExp(`constructor\\(private readonly repository: ${repoType}\\) \\{\\}`),
      `private readonly repository: ${repoType};\n  constructor(repository: ${repoType}) {\n    this.repository = repository;\n  }`
    );
    // Fix second use case if exists
    content = content.replace(
      new RegExp(`constructor\\(private readonly repository: ${repoType}\\) \\{\\}`),
      `private readonly repository: ${repoType};\n  constructor(repository: ${repoType}) {\n    this.repository = repository;\n  }`
    );
    
    fs.writeFileSync(file, content);
  }
};

fixUseCases('src/application/use-cases/teacher/classroom.use-cases.ts', 'ClassroomRepository');
fixUseCases('src/application/use-cases/teacher/live-session.use-cases.ts', 'LiveSessionRepository');
fixUseCases('src/application/use-cases/teacher/message.use-cases.ts', 'MessageRepository');
fixUseCases('src/application/use-cases/teacher/resource.use-cases.ts', 'ResourceRepository');

fixImport('src/domain/ports/classroom.repository.ts', 'Classroom');

// replace CheckCircle2, ImageIcon, Clock unused imports
replaceText('src/presentation/pages/teacher/classrooms/CreateClassroomPage.tsx', '  ImageIcon,\n', '');
replaceText('src/presentation/pages/teacher/classrooms/CreateClassroomPage.tsx', '  CheckCircle2,\n', '');
replaceText('src/presentation/pages/teacher/TeacherDashboardPage.tsx', '  Clock,\n', '');
