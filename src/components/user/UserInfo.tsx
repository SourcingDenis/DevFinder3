interface UserInfoProps {
  login?: string;
  bio?: string;
  location?: string;
  profileUrl?: string;
}

export function UserInfo({ login, bio, location, profileUrl }: UserInfoProps) {
  return (
    <div>
      {bio && <p className="text-sm text-muted-foreground">{bio}</p>}
      {location && (
        <p className="text-sm text-muted-foreground mt-1"> {location}</p>
      )}
      {login && profileUrl && (
        <a 
          href={profileUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm text-blue-600 hover:underline mt-1 block"
        >
          @{login} on GitHub
        </a>
      )}
    </div>
  );
}