# rm -Rf docs/* \
# 	&& npx typedoc \
# 		--readme none \
# 		--mode file \
# 		--plugin typedoc-plugin-markdown lib \
# 		--out docs \
# 		--namedAnchors \
# 		--hideBreadcrumbs \
# 		--excludeNotExported \
# 		--excludePrivate \
# 		--excludeProtected \
# 		--excludeExternals \
# 	&& npx concat-md \
# 		--toc \
# 		--decrease-title-levels \
# 		--file-name-as-title \
# 		docs \
# 		> README_test.md
