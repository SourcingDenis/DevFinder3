import { SavedSearches as SavedSearchesComponent } from '@/components/saved/SavedSearches';

export function SavedSearches() {
  return (
    <div className="container max-w-screen-2xl py-6">
      <h1 className="text-3xl font-bold mb-6">Saved Searches</h1>
      <SavedSearchesComponent />
    </div>
  );
}
