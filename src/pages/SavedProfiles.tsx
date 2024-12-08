import { SavedProfiles as SavedProfilesComponent } from '@/components/saved/SavedProfiles';

export function SavedProfiles() {
  return (
    <div className="container max-w-screen-2xl py-6">
      <h1 className="text-3xl font-bold mb-6">Saved Profiles</h1>
      <SavedProfilesComponent />
    </div>
  );
}
