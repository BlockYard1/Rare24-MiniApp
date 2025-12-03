export default async function Profile({ params }: { params: { username: string } }) {
  const { username } = await params;
  
  return (
    <div className="my-16">{username}</div>
  );
}