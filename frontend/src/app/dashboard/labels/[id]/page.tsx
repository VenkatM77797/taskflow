import { TaskBoardPage } from '@/components/TaskBoardPage';

export default function LabelPage({ params }: { params: { id: string } }) {
  return <TaskBoardPage title="Label" subtitle="Tasks connected to this label." labelId={params.id} />;
}
