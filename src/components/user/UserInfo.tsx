interface UserInfoProps {
  login: string;
  bio?: string;
  location?: string;
  profileUrl: string;
}

export function UserInfo({ login, bio, location, profileUrl }: UserInfoProps) {
  return (
    <div>
      {bio && <p className="text-sm text-muted-foreground">{bio}</p>}
      {location && (
        <p className="text-sm text-muted-foreground mt-1"> {location}</p>
      )}
    </div>
  );
}