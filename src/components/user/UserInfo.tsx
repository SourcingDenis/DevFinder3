interface UserInfoProps {
  name?: string;
  login: string;
  bio?: string;
  location?: string;
  profileUrl: string;
}

export function UserInfo({ name, login, bio, location, profileUrl }: UserInfoProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold">
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {name || login}
        </a>
      </h3>
      {bio && <p className="text-sm text-muted-foreground">{bio}</p>}
      {location && (
        <p className="text-sm text-muted-foreground mt-1">📍 {location}</p>
      )}
    </div>
  );
}