## 斐波那契数列

[斐波那契数列](https://baike.baidu.com/item/%E6%96%90%E6%B3%A2%E9%82%A3%E5%A5%91%E6%95%B0%E5%88%97)

```ruby
def fib(n)
  n < 2 ? n : fib(n-1) + fib(n-2)
end
```

```ruby
def fib(n, c = 0, ne = 1)
  return 0 if n == 0
  n == 1 ? ne : fib(n-1, ne, ne + c)
end
```

```ruby
def fib(n)
  c = 0
  ne = 1
  0.upto(n-1) do |i|
    c, ne = ne, c + ne
  end
  c
end

```

```ruby
class FibMatrix
  attr_accessor :matrix

  def initialize(arr = nil)
    @matrix = arr || [[1, 1], [1, 0]]
  end

  def *(mat)
    m00 = matrix[0][0] * mat.matrix[0][0] + matrix[0][1] * mat.matrix[1][0]
    m01 = matrix[0][0] * mat.matrix[0][1] + matrix[0][1] * mat.matrix[1][1]
    m10 = matrix[1][0] * mat.matrix[0][0] + matrix[1][1] * mat.matrix[1][0]
    m11 = matrix[1][0] * mat.matrix[0][1] + matrix[1][1] * mat.matrix[1][1]

    FibMatrix.new([[m00, m01], [m10, m11]])
  end

  def power(n)
    return self if n.abs == 1
    if n % 2 == 0
      tmp_matrix = power(n/2)
      tmp_matrix = tmp_matrix * tmp_matrix
    else
      tmp_matrix = power((n-1)/2)
      tmp_matrix = tmp_matrix * tmp_matrix
      tmp_matrix = tmp_matrix * self
    end
    tmp_matrix
  end
end

def fib(n)
  return n.abs if n.abs < 2
  lab = 1
  if n % 2 == 0 && n < 0
    lab = -1
  end
  n = n.abs
  mat = FibMatrix.new().power(n-1)
  mat.matrix[0][0] * lab
end
```