find client -type f | while read file; do
  dest="app/$file"
  mkdir -p "$(dirname "$dest")"
  git mv "$file" "$dest"
done
