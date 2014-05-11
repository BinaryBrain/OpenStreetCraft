
def slope(node1, node2)
  x1, y1 = node1
  x2, y2 = node2
  (x2 - x1).abs / (y2 - y1).abs
end

def cubes_on_segment(node1, node2)
  x1, _ = node1
  x2, _ = node2

  range = x1 < x2 ? (x1.to_i..x2.to_i) : (x2.to_i..x1.to_i)
  range.map do |n|
    [n, (slope(node1, node2) * n).to_i] rescue [nil, nil]
  end
end

def process_highway(list_nodes)
  list_nodes.map do |nodes|
    nodes.each_cons(2).map do |(node1, node2)|
      cubes_on_segment(node1, node2)
    end
  end
end
