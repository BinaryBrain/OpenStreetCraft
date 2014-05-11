require './utils.rb'

def process_highway(list_nodes)
  list_nodes.map do |nodes|
    nodes.each_cons(2).map do |(node1, node2)|
      x0, y0 = node1
      x1, y1 = node2
      line(x0, y0, x1, y1)
    end
  end
end
