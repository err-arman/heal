import { Container } from '@/components/ui/container';

export default function Loading() {
  return (
    <main id="main-content" className="py-12">
      <Container>
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-32 rounded bg-ink/10" />
          <div className="h-10 w-2/3 rounded bg-ink/10" />
          <div className="h-4 w-full max-w-2xl rounded bg-ink/10" />
          <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-44 rounded-xl bg-ink/10" />
            <div className="h-44 rounded-xl bg-ink/10" />
            <div className="h-44 rounded-xl bg-ink/10" />
          </div>
        </div>
      </Container>
    </main>
  );
}
