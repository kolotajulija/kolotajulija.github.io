# julijakolota.site

Сайт-визитка о ювелирном искусстве. Одна страница с навигацией по разделам,
светлая и тёмная темы, три языка (EN / RU / LV).

## Стек

Vite + TypeScript, без фреймворка. Ничего, кроме Node.js, для работы не нужно.

## Команды

```bash
npm install     # один раз, поставить зависимости
npm run dev     # локальный сервер с горячей перезагрузкой
npm run build   # сборка в dist/
npm run preview # посмотреть собранную версию
```

## Структура

```
index.html              разметка всех секций
src/main.ts             точка входа, сборка страницы
src/styles/tokens.css   цвета обеих тем и типографика — всё в одном месте
src/styles/main.css     остальные стили
src/i18n/config.ts      список языков
src/i18n/locales/*.json тексты сайта по языкам
src/data/works.json     работы для галереи
src/data/contacts.json  контакты
src/modules/            тема, навигация, галерея, лайтбокс, анимации
public/images/          изображения (пока заглушки)
```

## Как что менять

**Тексты** — `src/i18n/locales/<язык>.json`. В разметке стоят атрибуты
`data-i18n="hero.title"` — это путь до ключа в JSON.

**Добавить язык** — скопировать `en.json` в `<код>.json`, перевести и дописать
строчку в `src/i18n/config.ts`. Убрать язык — удалить строчку оттуда же.

**Добавить работу в галерею** — положить картинку в `public/images/works/`
и добавить объект в `src/data/works.json`.

**Цвета** — только `src/styles/tokens.css`: блок `:root` — тёмная тема,
`:root[data-theme='light']` — светлая.

## Публикация

Пуш в `main` запускает `.github/workflows/deploy.yml`: сборка и публикация
на GitHub Pages. В настройках репозитория Settings → Pages источник должен быть
**GitHub Actions**.
