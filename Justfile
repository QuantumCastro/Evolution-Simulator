set shell := ["pwsh", "-NoLogo", "-NoProfile", "-Command"]

default: verify

setup:
  pnpm install


lint:
  pnpm --dir frontend lint


type:
  pnpm --dir frontend type-check


test:
  pnpm --dir frontend test


scan:
  pnpm audit --prod


build:
  pnpm --dir frontend build


verify:
  just lint
  just type
  just test
  just build
  just scan

