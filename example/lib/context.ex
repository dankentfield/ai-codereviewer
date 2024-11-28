defmodule App.Context do
  def hello(colour) do
    if colour == :red do
      IO.puts("Hello, red")
    else
      IO.puts("Hello, world!")
    end
  end

  def hello_world(colour) do
    if colour == :red do
      IO.puts("Hello, red")
    else
      IO.puts("Hello, world!")
    end
  end

  def hello_colour(colour) do
    if colour == :red do
      IO.puts("Hello, red")
    elseif colour == :blue do
      IO.puts("Hello, blue")
    elseif colour == :green do
      IO.puts("Hello, green")
    else
      IO.puts("Hello, world!")
    end
  end
end

