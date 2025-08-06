def setup [] {
    print "\n📦 installing development dependencies..."
    bun install
    ^pre-commit install
}

# run the tests
export def test [verbose: bool = false] {
    bun test
    if ($verbose) {
        # print all the warnings
        bun test
    }
}

export def "pre-commit" [] {
    ^pre-commit run --all-files
}

# lint the project
export def lint [] {
    print "\n✅ running lints..."
    bun run lint
}

# quickly check the project
export def "check" [] {
    pre-commit
    test
}

export def "format" [] {
    bun run format
}

export alias fmt = format

# deletes the node_modules folder and recreate the environment from scratch
export def "clear" [] {
    print "🔥 deleting the node_modules folder"
    if ('node_modules/' | path exists) {
       rm node_modules/ --recursive --force
    } 
    print "♻️ recreating the env"
    install
    print "✅ done!"

}
