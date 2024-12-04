#!/bin/bash
find /Users/sinedovich/Desktop/project/src -type f -name "*.tsx" -exec sed -i '' 's/@\/components\/ui\/Button/@\/components\/ui\/button/g' {} +
find /Users/sinedovich/Desktop/project/src -type f -name "*.tsx" -exec sed -i '' 's/@\/components\/ui\/Input/@\/components\/ui\/input/g' {} +
find /Users/sinedovich/Desktop/project/src -type f -name "*.tsx" -exec sed -i '' 's/@\/components\/ui\/Dialog/@\/components\/ui\/dialog/g' {} +
