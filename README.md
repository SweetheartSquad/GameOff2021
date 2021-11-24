# We Follow The Fickle Path

![Ant](./src/assets/textures/basicAntIdle/basicAntIdle.1.png)

## Development

```sh
npm i # installs dependencies
npm start # starts dev server
npm run build # creates production build
```

Hot-reload is available for [`./src/assets/main.strand`](./src/assets/main.strand) which allows you to interactively edit passages, but most other changes will trigger a page refresh.

## Release

1. Bump the package version (`npm version patch/minor/major`)
2. Push changes
3. Go to [release action](https://github.com/SweetheartSquad/GameOff2021/actions/workflows/release.ymlhttps://github.com/SweetheartSquad/GameOff2021/actions/workflows/release.yml)
4. Select "Run workflow", and confirm on `main` branch

The workflow will automatically push
