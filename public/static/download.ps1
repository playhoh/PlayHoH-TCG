$target = $PSScriptRoot
$sheet = "https://docs.google.com/spreadsheets/d/1gqPpHI3cV4aA0acvhNAYBI6V0s4bszM6rajiKpRKg9o/gviz/tq?tqx=out:csv"
echo "Loading..."

curl "$sheet&gid=1012412622" | %{
    $path = "$target/effects.txt"
    Out-File -FilePath $path -InputObject $_.Content -Encoding "UTF8"
    echo "1 done"
}

curl "$sheet&gid=1387217869" | %{
    $path = "$target/beta1.txt"
    Out-File -FilePath $path -InputObject $_.Content -Encoding "UTF8"
    echo "2 done"
}

curl "$sheet&gid=1763669454" | %{
    $path = "$target/beta2.txt"
    Out-File -FilePath $path -InputObject $_.Content -Encoding "UTF8"
    echo "3 done"
}

curl "$sheet&gid=82944676" | %{
    $path = "$target/categories.txt"
    Out-File -FilePath $path -InputObject $_.Content -Encoding "UTF8"
    echo "4 done"
}

echo "All done"
