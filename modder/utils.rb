def line(x0, y0, x1, y1)
  range = x0 < x1 ? (x0.to_i..x1.to_i) : (x1.to_i..x0.to_i)
  range.map do |n|
    [n, (slope(x0, y0, x1, y1) * n).to_i] rescue [nil, nil]
  end
end

def slope(x0, y0, x1, y1)
  (x1 - x0).abs / (y1 - y0).abs
end
