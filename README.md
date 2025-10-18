# zako-box-be

## Development

```
bun dev
```

## Testing

Start the database and redis containers.

```
docker compose up -d --remove-orphans
```

Run the tests.

```
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
