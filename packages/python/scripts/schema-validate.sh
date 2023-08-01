local_hash=$(cat ./techspec/schema.json | sha256sum | cut -d " " -f 1);
global_hash=$(cat ../../schema/schema.json | sha256sum | cut -d " " -f 1);
if test $local_hash = $global_hash; then
    echo 'Schema is up to date';
    exit 0;
else
    echo 'Schema is outdated';
    exit 1;
fi
