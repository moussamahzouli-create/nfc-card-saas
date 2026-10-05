import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ChoiceSubRoute({ params }: Props) {
  const { token } = await params;
  redirect(`/c/${encodeURIComponent(token)}?view=choice`);
}
