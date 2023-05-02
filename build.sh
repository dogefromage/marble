base_path=$(pwd)/packages

echo ">>>> Building interactive"
cd $base_path/interactive
yarn build

echo ">>>> Building language"
cd $base_path/language
yarn build

echo ">>>> Linking Monorepo"
cd $base_path
yarn

echo ">>>> Building vite-plugin-glsl-templates"
cd $base_path/vite-plugin-glsl-templates
yarn build

echo ">>>> Linking Monorepo"
cd $base_path
yarn

echo ">>>> Building app"
cd $base_path/app
yarn build

echo ">>>> Linking Monorepo"
cd $base_path
yarn

echo ">>>> Linking Monorepo"
cd $base_path
yarn

echo ">>>> Building web"
cd $base_path/web
yarn build

echo ">>>> Linking Monorepo"
cd $base_path
yarn