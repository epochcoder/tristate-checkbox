# Description

The `TristateCheckbox` allows any checkbox element to have an extra state defined.
this state means that some of it's children are selected, but not all of them

This gets determined by a built in `dependencySelector`.
it is customizable to almost any context

one tristate can even set the state of another, this is all built in via events

[Demo](https://epochcoder.github.io/tristate-checkbox/)

## Basic Usage

	<form id="basic-usage">
		<table>
			<tr>
				<td>Basic tri-state (has little to no function like this) : </td>
				<td>
					<input id="cb-1" type="checkbox"/>
				</td>
			</tr>
		</table>
	</form>
	<script>
		document.observe('dom:loaded', function() {
			new TriStateCheckbox('cb-1');
		});
	</script>

## Advanced Usage

	<form id="adv-usage">
		<table>
			<tr>
				<td>normal tri-state : </td>
				<td>
					<input id="cb-a-1" type="checkbox"/>
				</td>
			</tr>
			<tr>
				<td>child 1 : </td>
				<td>
					<input id="cb-c-1" type="checkbox"/>
				</td>
			</tr>
			<tr>
				<td>child 2 : </td>
				<td>
					<input id="cb-c-2" type="checkbox"/>
				</td>
			</tr>
			<tr>
				<td>child 3 : </td>
				<td>
					<input id="cb-c-3" type="checkbox"/>
				</td>
			</tr>
		</table>
	</form>
	<script>
		document.observe('dom:loaded', function() {
			new TriStateCheckbox('cb-a-1', {
				dependantSelector: 'form#adv-usage input[id^="cb-c"]'
			});
		});
	</script>