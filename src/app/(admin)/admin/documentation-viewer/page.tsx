
import { promises as fs } from 'fs';
import path from 'path';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText } from 'lucide-react';

async function getDocumentationContent() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'project-documentation.html');
    const fileContent = await fs.readFile(filePath, 'utf8');
    return fileContent;
  } catch (error) {
    console.error("Failed to read documentation file:", error);
    return null;
  }
}

export default async function DocumentationViewerPage() {
  const content = await getDocumentationContent();

  if (!content) {
    return (
        <div className="container mx-auto max-w-4xl py-12">
             <Alert variant="destructive">
                <AlertTitle>Error Reading File</AlertTitle>
                <AlertDescription>
                    Could not load the content of project-documentation.html. The file might be missing or corrupted.
                </AlertDescription>
            </Alert>
        </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl py-12">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary"/>
                    <CardTitle>Project Documentation Source</CardTitle>
                </div>
                <CardDescription>
                    The full HTML content of the project documentation is below. You can select all (Ctrl+A or Cmd+A), copy (Ctrl+C or Cmd+C), and paste it into a new file named `documentation.html` on your local computer.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea 
                    readOnly
                    value={content}
                    className="h-[70vh] w-full font-mono text-xs"
                    aria-label="Documentation HTML content"
                />
            </CardContent>
        </Card>
    </div>
  );
}
