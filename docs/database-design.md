# Database Design

## Initial Normalized Tables

- users
- user_profiles
- rides
- ride_stops
- ride_requests
- chats
- chat_participants
- chat_messages
- refresh_tokens

## Notes

- Use UUID primary keys for externally exposed resources.
- Store passwords as hashes only.
- Keep ride origin, destination, and optional stops normalized enough to support search and route features.
- Track timestamps with `created_at` and `updated_at`.
- Use status columns for rides and requests instead of deleting active workflow records.

