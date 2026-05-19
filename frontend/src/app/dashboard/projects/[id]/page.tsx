import { TaskBoardPage } from '@/components/TaskBoardPage';

export default function ProjectPage({ params }: { params: { id: string } }) {
  return <TaskBoardPage title="Project" subtitle="Tasks inside this project." projectId={params.id} />;
}
