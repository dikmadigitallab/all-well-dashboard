$f = "src/routes/_authenticated/kanban-exames.tsx"
$c = Get-Content $f -Raw

# Fix 1: Replace the broken aAgendar section
$old = @"
      ...exames
        .filter((e) => e.status === "faltou")
        .map(
          (e): ExameCard => ({