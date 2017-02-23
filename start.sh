#!/bin/sh

echo "Generating kittens.out"
node src/index.js < inputs/kittens.in > outputs/kittens.out
echo "Generating me_at_the_zoo.out"
node src/index.js < inputs/me_at_the_zoo.in > outputs/me_at_the_zoo.out
echo "Generating trending_today.out"
node src/index.js < inputs/trending_today.in > outputs/trending_today.out
echo "Generating videos_worth_spreading.out"
node src/index.js < inputs/videos_worth_spreading.in > outputs/videos_worth_spreading.out
