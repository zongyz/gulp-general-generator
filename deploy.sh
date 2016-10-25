#!/bin/sh 

packageFile=$1
siteDir=$2
packageArchiveDir=$siteDir"package/"
publishDir=$siteDir"publish/"
tmpDir=$siteDir"publish-tmp/"

#check package file
if [ ! -f $packageFile ]; then
    echo 'package file not exist!'
    exit 0
fi

#check site dir
if [ ! $siteDir ]; then
    echo 'site dir not define!'
    exit 0
fi

#check archive folder
if [ ! -d $packageArchiveDir ]; then
    echo 'archive dir not exist, create it!'
    mkdir -p $packageArchiveDir
fi

#check publish folder
if [ ! -d $publishDir ]; then
    echo 'publish dir not exist, create it!'
    mkdir -p $publishDir
fi

#check tmp folder
if [ ! -d $tmpDir ]; then
    echo 'tmp dir not exist, create it!'
    mkdir -p $tmpDir
fi

#archive package file
cp $packageFile $packageArchiveDir

#unzip package
unzip $packageFile -d $tmpDir

#delete publish folder
rm -rf $publishDir

#rename publish folder
mv $tmpDir $publishDir