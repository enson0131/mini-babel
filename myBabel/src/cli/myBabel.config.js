function plugin2({types, template}, options) {
    return {
        visitor: {
            Program(path) {
                Object.entries(path.scope.binding).forEach(([id, binding]) => {
                    if (!binding.referenced) {
                        binding.path.remove();
                    }
                })
            },
            FunctionDeclaration(path) {
                Object.entries(path.scope.binding).forEach(([id, binding]) => {
                    if (!binding.referenced) {
                        binding.path.remove();
                    }
                })
            }
        }
    }
}

module.exports = {
    parserOpts: {
        plugins: ['literal', 'cvteKeyword']
    },
    plugins: [
        [plugin2]
    ]
}