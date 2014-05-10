#!/usr/bin/env ruby

require 'json'

def find_highway(data)
  data['way'].select do |elem|
    elem['tags'].include? 'highway'
  end
end

json_file = './OSMData.json'
data = JSON.parse(File.open(json_file).read)
highways = find_highway data
p highways
