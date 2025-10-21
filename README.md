# zako-box-be

## Development

```
docker compose down
docker compose up -d --remove-orhpans

bun db:migrate
bun dev
```

## Testing

Start the database and redis containers.

```
docker compose down
docker compose up -d --remove-orphans
```

Run the tests.

```
bun db:migrate
bun test
```

Stop the database and redis containers.

```
docker compose down
```

## Production

```
bun build
```

## Deployment

```
docker build -t zako-box-be .
docker run -p 3000:3000 zako-box-be
```
